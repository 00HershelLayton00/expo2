// app/admin/index.tsx
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { Chofer, supabase } from '../../lib/supabase/client';

const PIN_CORRECTO = '2026';
const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZm9hdXpjZGR2Z2FtZ3dvZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNTU1NjgsImV4cCI6MjA1OTkzMTU2OH0.dummy_change_this_key'; // ← REEMPLAZA CON TU ANON KEY REAL

// Función para subir imágenes
async function uploadImageWeb(file: File, path: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/choferes/${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: formData
    });
    
    if (response.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/choferes/${path}`;
    }
    return null;
  } catch (error) {
    console.error('Error uploading:', error);
    return null;
  }
}

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'crear' | 'pendientes' | 'activos'>('crear');
  
  const [solicitudes, setSolicitudes] = useState<Chofer[]>([]);
  const [choferesActivos, setChoferesActivos] = useState<Chofer[]>([]);
  
  // Formulario (incluye ID para edición)
  const [formData, setFormData] = useState({
    id: '',
    nombre_completo: '',
    ci: '',
    chapa: '',
    telefono_whatsapp: '',
    cobertura_provincial: false,
    cobertura_municipal: false,
    cobertura_centro: false,
    horario_habitual: '',
    notas_extra: '',
    foto_perfil_url: '',
    foto_carro_url: ''
  });

  // --- Autenticación ---
  const verificarPin = () => {
    if (pin === PIN_CORRECTO) {
      setAutenticado(true);
      cargarDatos();
    } else {
      Alert.alert('Error', 'PIN Incorrecto');
    }
  };

  // --- Carga de Datos ---
  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarSolicitudes(), cargarActivos()]);
    setLoading(false);
  };

  const cargarSolicitudes = async () => {
    // @ts-ignore
    const { data } = await supabase.from('choferes').select('*').eq('estado_suscripcion', 'pendiente');
    if (data) setSolicitudes(data);
  };

  const cargarActivos = async () => {
    // @ts-ignore
    const { data } = await supabase.from('choferes').select('*').eq('estado_suscripcion', 'activo');
    if (data) setChoferesActivos(data);
  };

  // --- Acciones CRUD ---
  const aprobarChofer = async (id: string) => {
    // @ts-ignore
    await supabase.from('choferes').update({ estado_suscripcion: 'activo' }).eq('id', id);
    cargarDatos();
    Alert.alert('✅ Éxito', 'Chofer aprobado');
  };

  const suspenderChofer = async (id: string) => {
    // @ts-ignore
    await supabase.from('choferes').update({ estado_suscripcion: 'suspendido' }).eq('id', id);
    cargarDatos();
    Alert.alert('⏸️ Suspendido', 'Chofer suspendido');
  };

  const eliminarChofer = (id: string, nombre: string) => {
    Alert.alert('⚠️ Confirmar', `¿Eliminar permanentemente a ${nombre}?`, [
      { text: 'Cancelar' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: async () => {
          // @ts-ignore
          await supabase.from('choferes').delete().eq('id', id);
          cargarDatos();
          Alert.alert('🗑️ Eliminado', 'Chofer eliminado');
        }
      }
    ]);
  };

  const guardarChofer = async () => {
    if (!formData.nombre_completo || !formData.ci || !formData.chapa || !formData.telefono_whatsapp) {
      Alert.alert('Error', 'Nombre, CI, Chapa y WhatsApp son obligatorios');
      return;
    }

    const cobertura = [];
    if (formData.cobertura_provincial) cobertura.push('provincial');
    if (formData.cobertura_municipal) cobertura.push('municipal');
    if (formData.cobertura_centro) cobertura.push('centro_ciudad');

    const payload = {
      nombre_completo: formData.nombre_completo,
      ci: formData.ci,
      chapa: formData.chapa,
      telefono_whatsapp: formData.telefono_whatsapp,
      cobertura,
      condiciones: {
        horario_habitual: formData.horario_habitual,
        notas_extra: formData.notas_extra
      },
      foto_perfil_url: formData.foto_perfil_url || null,
      foto_carro_url: formData.foto_carro_url || null,
    };

    try {
      if (formData.id) {
        // ACTUALIZAR
        // @ts-ignore
        const { error } = await supabase.from('choferes').update(payload).eq('id', formData.id);
        if (error) throw error;
        Alert.alert('✅ Éxito', 'Chofer actualizado correctamente');
      } else {
        // CREAR
        // @ts-ignore
        const { error } = await supabase.from('choferes').insert([{ ...payload, estado_suscripcion: 'pendiente' }]);
        if (error) throw error;
        Alert.alert('✅ Éxito', 'Chofer creado. Ahora puedes aprobarlo en Pendientes');
      }
      limpiarFormulario();
      cargarDatos();
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'No se pudo guardar');
    }
  };

  const editarChofer = (chofer: Chofer) => {
    setFormData({
      id: chofer.id,
      nombre_completo: chofer.nombre_completo || '',
      ci: chofer.ci || '',
      chapa: chofer.chapa || '',
      telefono_whatsapp: chofer.telefono_whatsapp || '',
      cobertura_provincial: chofer.cobertura?.includes('provincial') || false,
      cobertura_municipal: chofer.cobertura?.includes('municipal') || false,
      cobertura_centro: chofer.cobertura?.includes('centro_ciudad') || false,
      horario_habitual: chofer.condiciones?.horario_habitual || '',
      notas_extra: chofer.condiciones?.notas_extra || '',
      foto_perfil_url: chofer.foto_perfil_url || '',
      foto_carro_url: chofer.foto_carro_url || ''
    });
    setPestanaActiva('crear');
  };

  // --- Subida de Imágenes ---
  const seleccionarImagen = async (tipo: 'perfil' | 'carro') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const file = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const path = `${tipo}/${Date.now()}.jpg`;
      const publicUrl = await uploadImageWeb(file, path);
      
      if (publicUrl) {
        setFormData(prev => ({
          ...prev,
          [tipo === 'perfil' ? 'foto_perfil_url' : 'foto_carro_url']: publicUrl
        }));
        Alert.alert('✅ Éxito', 'Imagen subida');
      } else {
        Alert.alert('❌ Error', 'No se pudo subir la imagen');
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      id: '', nombre_completo: '', ci: '', chapa: '', telefono_whatsapp: '',
      cobertura_provincial: false, cobertura_municipal: false, cobertura_centro: false,
      horario_habitual: '', notas_extra: '', foto_perfil_url: '', foto_carro_url: ''
    });
  };

  // --- Login Screen ---
  if (!autenticado) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.tituloLogin}>🔐 Panel Cuber</Text>
        <TextInput 
          style={styles.input} 
          placeholder="PIN de Administrador" 
          secureTextEntry 
          value={pin} 
          onChangeText={setPin} 
        />
        <TouchableOpacity style={styles.botonLogin} onPress={verificarPin}>
          <Text style={styles.botonLoginTexto}>Acceder</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Panel Principal ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Panel Admin</Text>
        <TouchableOpacity onPress={() => setAutenticado(false)}>
          <Text style={styles.salir}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Pestañas */}
      <View style={styles.pestanasContainer}>
        {['crear', 'pendientes', 'activos'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.pestana, pestanaActiva === tab && styles.pestanaActiva]}
            onPress={() => setPestanaActiva(tab as any)}>
            <Text style={[styles.pestanaTexto, pestanaActiva === tab && styles.pestanaTextoActiva]}>
              {tab === 'crear' && '➕ Crear'}
              {tab === 'pendientes' && `⏳ Pendientes (${solicitudes.length})`}
              {tab === 'activos' && `✅ Activos (${choferesActivos.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido - Crear/Editar */}
      {pestanaActiva === 'crear' && (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitulo}>
            {formData.id ? '✏️ Editar Chofer' : '➕ Nuevo Chofer'}
          </Text>
          
          {/* Fotos */}
          <View style={styles.fotosRow}>
            <TouchableOpacity style={styles.fotoButton} onPress={() => seleccionarImagen('perfil')}>
              {formData.foto_perfil_url ? (
                <Image source={{ uri: formData.foto_perfil_url }} style={styles.fotoPreview} />
              ) : (
                <Text>📸 Foto Perfil</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.fotoButton} onPress={() => seleccionarImagen('carro')}>
              {formData.foto_carro_url ? (
                <Image source={{ uri: formData.foto_carro_url }} style={styles.fotoPreview} />
              ) : (
                <Text>🚗 Foto Carro</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Campos de Texto */}
          <TextInput style={styles.formInput} placeholder="Nombre Completo *" value={formData.nombre_completo} onChangeText={(t) => setFormData({...formData, nombre_completo: t})} />
          <TextInput style={styles.formInput} placeholder="Carnet de Identidad (CI) *" value={formData.ci} onChangeText={(t) => setFormData({...formData, ci: t})} />
          <TextInput style={styles.formInput} placeholder="Chapa (Placa) *" value={formData.chapa} onChangeText={(t) => setFormData({...formData, chapa: t})} />
          <TextInput style={styles.formInput} placeholder="WhatsApp (53XXXXXXXX) *" value={formData.telefono_whatsapp} onChangeText={(t) => setFormData({...formData, telefono_whatsapp: t})} keyboardType="phone-pad" />
          
          {/* Cobertura */}
          <Text style={styles.label}>Cobertura:</Text>
          <View style={styles.checkRow}>
            <TouchableOpacity style={styles.checkItem} onPress={() => setFormData({...formData, cobertura_provincial: !formData.cobertura_provincial})}>
              <View style={[styles.checkbox, formData.cobertura_provincial && styles.checkboxChecked]} />
              <Text>Provincial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkItem} onPress={() => setFormData({...formData, cobertura_municipal: !formData.cobertura_municipal})}>
              <View style={[styles.checkbox, formData.cobertura_municipal && styles.checkboxChecked]} />
              <Text>Municipal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkItem} onPress={() => setFormData({...formData, cobertura_centro: !formData.cobertura_centro})}>
              <View style={[styles.checkbox, formData.cobertura_centro && styles.checkboxChecked]} />
              <Text>Centro</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.formInput} placeholder="Horario Habitual" value={formData.horario_habitual} onChangeText={(t) => setFormData({...formData, horario_habitual: t})} />
          <TextInput style={[styles.formInput, styles.textArea]} placeholder="Notas/Condiciones adicionales" value={formData.notas_extra} onChangeText={(t) => setFormData({...formData, notas_extra: t})} multiline numberOfLines={3} />
          
          <View style={styles.botonesRow}>
            <TouchableOpacity style={styles.botonGuardar} onPress={guardarChofer}>
              <Text style={styles.botonGuardarTexto}>
                {formData.id ? '💾 Actualizar' : '💾 Guardar Chofer'}
              </Text>
            </TouchableOpacity>
            {formData.id && (
              <TouchableOpacity style={styles.botonCancelar} onPress={limpiarFormulario}>
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Contenido - Pendientes */}
      {pestanaActiva === 'pendientes' && (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{item.nombre_completo}</Text>
                  <Text style={styles.cardCi}>🆔 {item.ci || 'Sin CI'}</Text>
                  <Text style={styles.cardChapa}>🚘 {item.chapa}</Text>
                  <Text style={styles.cardWhatsApp}>📞 {item.telefono_whatsapp}</Text>
                </View>
                {item.foto_perfil_url && (
                  <Image source={{ uri: item.foto_perfil_url }} style={styles.cardAvatar} />
                )}
              </View>
              <View style={styles.cardAcciones}>
                <TouchableOpacity style={styles.botonAprobar} onPress={() => aprobarChofer(item.id)}>
                  <Text style={styles.botonAccionTexto}>✅ Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonEditar} onPress={() => editarChofer(item)}>
                  <Text style={styles.botonAccionTexto}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarChofer(item.id, item.nombre_completo)}>
                  <Text style={styles.botonAccionTexto}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vacio}>No hay solicitudes pendientes</Text>}
        />
      )}

      {/* Contenido - Activos */}
      {pestanaActiva === 'activos' && (
        <FlatList
          data={choferesActivos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{item.nombre_completo}</Text>
                  <Text style={styles.cardCi}>🆔 {item.ci || 'Sin CI'}</Text>
                  <Text style={styles.cardChapa}>🚘 {item.chapa}</Text>
                  <Text style={styles.cardWhatsApp}>📞 {item.telefono_whatsapp}</Text>
                  <Text style={styles.cardRating}>⭐ {item.rating_trato?.toFixed(1) || '5.0'}</Text>
                </View>
                {item.foto_perfil_url && (
                  <Image source={{ uri: item.foto_perfil_url }} style={styles.cardAvatar} />
                )}
              </View>
              <View style={styles.cardAcciones}>
                <TouchableOpacity style={styles.botonEditar} onPress={() => editarChofer(item)}>
                  <Text style={styles.botonAccionTexto}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonSuspender} onPress={() => suspenderChofer(item.id)}>
                  <Text style={styles.botonAccionTexto}>⏸️ Suspender</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarChofer(item.id, item.nombre_completo)}>
                  <Text style={styles.botonAccionTexto}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vacio}>No hay choferes activos</Text>}
        />
      )}
    </View>
  );
}

// --- ESTILOS (StyleSheet tradicional) ---
const styles = StyleSheet.create({
  // Login
  loginContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#15803D' },
  tituloLogin: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, fontSize: 16, textAlign: 'center' },
  botonLogin: { backgroundColor: '#22C55E', padding: 15, borderRadius: 10, marginTop: 20 },
  botonLoginTexto: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },

  // Container Principal
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#15803D' },
  salir: { color: '#EF4444', fontWeight: '600' },

  // Pestañas
  pestanasContainer: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 10 },
  pestana: { flex: 1, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  pestanaActiva: { backgroundColor: '#DCFCE7', borderBottomWidth: 2, borderBottomColor: '#15803D' },
  pestanaTexto: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  pestanaTextoActiva: { color: '#15803D' },

  // Formulario
  formContainer: { padding: 20 },
  formTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  fotosRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  fotoButton: { flex: 1, height: 120, backgroundColor: '#E5E7EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15803D', borderStyle: 'dashed' },
  fotoPreview: { width: '100%', height: '100%', borderRadius: 12 },
  formInput: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#D1D5DB', fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  label: { fontWeight: '600', color: '#374151', marginBottom: 8, fontSize: 16 },
  checkRow: { flexDirection: 'row', gap: 20, marginBottom: 15, flexWrap: 'wrap' },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF' },
  checkboxChecked: { backgroundColor: '#15803D', borderColor: '#15803D' },
  botonesRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botonGuardar: { flex: 1, backgroundColor: '#15803D', padding: 16, borderRadius: 12, alignItems: 'center' },
  botonGuardarTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  botonCancelar: { backgroundColor: '#6B7280', padding: 16, borderRadius: 12, alignItems: 'center', minWidth: 100 },
  botonCancelarTexto: { color: 'white', fontWeight: 'bold' },

  // Listas y Tarjetas
  listContainer: { padding: 15 },
  card: { backgroundColor: 'white', padding: 15, marginBottom: 12, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { flex: 1 },
  cardNombre: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  cardCi: { fontSize: 14, color: '#4B5563', marginTop: 2 },
  cardChapa: { fontSize: 14, color: '#4B5563', marginTop: 2 },
  cardWhatsApp: { fontSize: 14, color: '#4B5563', marginTop: 2 },
  cardRating: { fontSize: 14, color: '#F59E0B', marginTop: 4, fontWeight: '500' },
  cardAvatar: { width: 60, height: 60, borderRadius: 30 },
  cardAcciones: { flexDirection: 'row', marginTop: 15, gap: 8 },
  botonAprobar: { flex: 1, backgroundColor: '#22C55E', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonEditar: { flex: 1, backgroundColor: '#3B82F6', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonSuspender: { flex: 1, backgroundColor: '#F97316', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonEliminar: { flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonAccionTexto: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  vacio: { textAlign: 'center', color: '#9CA3AF', fontSize: 16, padding: 40 }
});