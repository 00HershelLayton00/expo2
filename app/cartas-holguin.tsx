import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Chofer, supabase } from '../lib/supabase/client';

// Componente de Insignia Visual
const Insignia = ({ tipo, activo }: { tipo: string; activo: boolean }) => {
  if (!activo) return null;
  const config: any = {
    verificado: { texto: '✅ Verificado', color: '#2E7D32' },
    puntualidad: { texto: '⏱️ Puntualidad Oro', color: '#F57C00' },
    trato: { texto: '🤝 Trato Excelente', color: '#1976D2' },
  };
  const estilo = config[tipo];
  return (
    <View style={[styles.insignia, { backgroundColor: estilo.color }]}>
      <Text style={styles.insigniaTexto}>{estilo.texto}</Text>
    </View>
  );
};

export default function CartasHolguin() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCobertura, setFiltroCobertura] = useState('todas');
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const opcionesFiltro = [
    { label: 'Todos los viajes', value: 'todas' },
    { label: 'Provincial', value: 'provincial' },
    { label: 'Municipal', value: 'municipal' },
    { label: 'Centro Ciudad', value: 'centro_ciudad' },
  ];

  useEffect(() => {
    fetchChoferes();
  }, []);

  async function fetchChoferes() {
    setLoading(true);
    // @ts-ignore - Nuestro cliente fetch personalizado
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .eq('estado_suscripcion', 'activo')
      .order('rating_trato', { ascending: false });

    if (data) setChoferes(data as Chofer[]);
    setLoading(false);
  }

  const contactarChofer = (chofer: Chofer) => {
    const mensaje = encodeURIComponent(
      mensajePersonalizado ||
        `Hola ${chofer.nombre_completo}, vi tu perfil en Cuber Holguín. Necesito un viaje. ¿Disponible?`
    );
    // Llamada a nuestra API de enmascaramiento
    const url = `/api/contactar/${chofer.id}?mensaje=${mensaje}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const renderChofer = ({ item }: { item: Chofer }) => {
    if (filtroCobertura !== 'todas' && !item.cobertura?.includes(filtroCobertura)) {
      return null;
    }

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={{ uri: item.foto_perfil_url || 'https://via.placeholder.com/50' }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.nombre}>{item.nombre_completo}</Text>
            <Text style={styles.chapa}>🚘 {item.chapa}</Text>
          </View>
        </View>

        {item.foto_carro_url && (
          <Image source={{ uri: item.foto_carro_url }} style={styles.carroImagen} />
        )}

        <View style={styles.insigniasContainer}>
          <Insignia tipo="verificado" activo={true} />
          <Insignia tipo="puntualidad" activo={item.rating_puntualidad > 4.5} />
          <Insignia tipo="trato" activo={item.rating_trato > 4.5} />
        </View>

        <Text style={styles.cobertura}>
          📍 Cobertura: {item.cobertura?.join(' · ') || 'No especificada'}
        </Text>
        <Text style={styles.horario}>
          🕒 {item.condiciones?.horario_habitual || 'Horario no especificado'}
        </Text>
        <Text style={styles.condiciones}>
          💬 {item.condiciones?.notas_extra || 'Sin condiciones adicionales'}
        </Text>

        <TouchableOpacity style={styles.botonContacto} onPress={() => contactarChofer(item)}>
          <Text style={styles.botonTexto}>📞 CONTACTAR POR WHATSAPP</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#128C7E" />
        <Text>Cargando choferes de Holguín...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🚖 Cuber Holguín</Text>
      
      {/* Selector de Filtro Personalizado */}
      <TouchableOpacity style={styles.filtroBoton} onPress={() => setModalVisible(true)}>
        <Text style={styles.filtroTexto}>
          {opcionesFiltro.find(o => o.value === filtroCobertura)?.label || 'Filtrar por cobertura'}
        </Text>
        <Text style={styles.filtroIcono}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContenido}>
            <ScrollView>
              {opcionesFiltro.map((opcion) => (
                <TouchableOpacity
                  key={opcion.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setFiltroCobertura(opcion.value);
                    setModalVisible(false);
                  }}>
                  <Text style={styles.modalItemTexto}>{opcion.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.mensajeContainer}>
        <Text style={styles.label}>Mensaje para el chofer (opcional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Viaje para mañana a Gibara..."
          value={mensajePersonalizado}
          onChangeText={setMensajePersonalizado}
        />
      </View>

      <FlatList
        data={choferes}
        renderItem={renderChofer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', paddingTop: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#128C7E', marginBottom: 10 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filtroBoton: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtroTexto: { fontSize: 16, color: '#333' },
  filtroIcono: { fontSize: 12, color: '#666' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxHeight: '50%',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalItemTexto: { fontSize: 16, textAlign: 'center' },
  mensajeContainer: { paddingHorizontal: 16, marginBottom: 10 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  card: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  headerText: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: 'bold' },
  chapa: { color: '#555', marginTop: 2 },
  carroImagen: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  insigniasContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  insignia: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8, marginBottom: 4 },
  insigniaTexto: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  cobertura: { marginBottom: 6, fontSize: 14 },
  horario: { marginBottom: 6, fontSize: 14, fontWeight: '500' },
  condiciones: { marginBottom: 16, fontSize: 13, color: '#444', fontStyle: 'italic' },
  botonContacto: { backgroundColor: '#25D366', padding: 16, borderRadius: 30, alignItems: 'center' },
  botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});