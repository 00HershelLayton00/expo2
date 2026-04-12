// app/admin/index.tsx
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image, ScrollView,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { Chofer, supabase } from '../../lib/supabase/client';
import { uploadImageWeb } from '../../lib/supabase/storage';
import { adminStyles as styles } from '../../styles/adminStyles';

const PIN_CORRECTO = '2026';

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'crear' | 'pendientes' | 'activos'>('crear');
  
  // Datos
  const [solicitudes, setSolicitudes] = useState<Chofer[]>([]);
  const [choferesActivos, setChoferesActivos] = useState<Chofer[]>([]);
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
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
    Alert.alert('⚠️ Confirmar', `¿Eliminar a ${nombre}?`, [
      { text: 'Cancelar' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: async () => {
          // @ts-ignore
          await supabase.from('choferes').delete().eq('id', id);
          cargarDatos();
        }
      }
    ]);
  };

  const guardarChofer = async () => {
    if (!formData.nombre_completo || !formData.chapa || !formData.telefono_whatsapp) {
      Alert.alert('Error', 'Nombre, Chapa y WhatsApp son obligatorios');
      return;
    }

    const cobertura = [];
    if (formData.cobertura_provincial) cobertura.push('provincial');
    if (formData.cobertura_municipal) cobertura.push('municipal');
    if (formData.cobertura_centro) cobertura.push('centro_ciudad');

    const payload = {
      nombre_completo: formData.nombre_completo,
      chapa: formData.chapa,
      telefono_whatsapp: formData.telefono_whatsapp,
      cobertura,
      condiciones: {
        horario_habitual: formData.horario_habitual,
        notas_extra: formData.notas_extra
      },
      foto_perfil_url: formData.foto_perfil_url,
      foto_carro_url: formData.foto_carro_url,
      estado_suscripcion: 'pendiente'
    };

    // @ts-ignore
    const { error } = await supabase.from('choferes').insert([payload]);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar');
    } else {
      Alert.alert('Éxito', 'Chofer creado. Aprueba en Pendientes');
      limpiarFormulario();
      cargarDatos();
    }
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
        Alert.alert('Éxito', 'Imagen subida');
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre_completo: '', chapa: '', telefono_whatsapp: '',
      cobertura_provincial: false, cobertura_municipal: false, cobertura_centro: false,
      horario_habitual: '', notas_extra: '', foto_perfil_url: '', foto_carro_url: ''
    });
  };

  // --- Login Screen ---
  if (!autenticado) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.tituloLogin}>🔐 Panel Cuber</Text>
        <TextInput style={styles.input} placeholder="PIN" secureTextEntry value={pin} onChangeText={setPin} />
        <TouchableOpacity style={styles.botonLogin} onPress={verificarPin}>
          <Text style={styles.botonLoginTexto}>Acceder</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Panel Principal ---
  return (
    <View style={styles.container}>
      <View style={styles.headerAdmin}>
        <Text style={styles.tituloAdmin}>Panel Admin</Text>
        <TouchableOpacity onPress={() => setAutenticado(false)}>
          <Text style={styles.cerrarSesion}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pestanasContainer}>
        {['crear', 'pendientes', 'activos'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.pestana, pestanaActiva === tab && styles.pestanaActiva]} 
            onPress={() => setPestanaActiva(tab as any)}>
            <Text style={styles.pestanaTexto}>
              {tab === 'crear' && '➕ Crear'}
              {tab === 'pendientes' && `⏳ Pendientes (${solicitudes.length})`}
              {tab === 'activos' && `✅ Activos (${choferesActivos.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {pestanaActiva === 'crear' && (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitulo}>Nuevo Chofer</Text>
          
          <TouchableOpacity style={styles.fotoButton} onPress={() => seleccionarImagen('perfil')}>
            {formData.foto_perfil_url ? (
              <Image source={{ uri: formData.foto_perfil_url }} style={styles.fotoPreview} />
            ) : (
              <Text>📸 Subir Foto Perfil</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.fotoButton} onPress={() => seleccionarImagen('carro')}>
            {formData.foto_carro_url ? (
              <Image source={{ uri: formData.foto_carro_url }} style={styles.fotoPreview} />
            ) : (
              <Text>🚗 Subir Foto del Carro</Text>
            )}
          </TouchableOpacity>

          <TextInput style={styles.formInput} placeholder="Nombre Completo *" value={formData.nombre_completo} onChangeText={(t) => setFormData({...formData, nombre_completo: t})} />
          <TextInput style={styles.formInput} placeholder="Chapa *" value={formData.chapa} onChangeText={(t) => setFormData({...formData, chapa: t})} />
          <TextInput style={styles.formInput} placeholder="WhatsApp (53XXXXXXXX) *" value={formData.telefono_whatsapp} onChangeText={(t) => setFormData({...formData, telefono_whatsapp: t})} />
          
          <Text style={styles.label}>Cobertura:</Text>
          <View style={styles.checkRow}>
            <TouchableOpacity onPress={() => setFormData({...formData, cobertura_provincial: !formData.cobertura_provincial})}>
              <Text>{formData.cobertura_provincial ? '✅' : '⬜'} Provincial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFormData({...formData, cobertura_municipal: !formData.cobertura_municipal})}>
              <Text>{formData.cobertura_municipal ? '✅' : '⬜'} Municipal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFormData({...formData, cobertura_centro: !formData.cobertura_centro})}>
              <Text>{formData.cobertura_centro ? '✅' : '⬜'} Centro</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.formInput} placeholder="Horario Habitual" value={formData.horario_habitual} onChangeText={(t) => setFormData({...formData, horario_habitual: t})} />
          <TextInput style={styles.formInput} placeholder="Notas/Condiciones" value={formData.notas_extra} onChangeText={(t) => setFormData({...formData, notas_extra: t})} multiline />
          
          <TouchableOpacity style={styles.botonGuardar} onPress={guardarChofer}>
            <Text style={styles.botonGuardarTexto}>💾 Guardar Chofer</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {pestanaActiva === 'pendientes' && (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardChofer}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{item.nombre_completo}</Text>
                  <Text style={styles.cardChapa}>🚘 {item.chapa}</Text>
                </View>
                {item.foto_perfil_url && <Image source={{ uri: item.foto_perfil_url }} style={styles.cardAvatar} />}
              </View>
              <View style={styles.cardAcciones}>
                <TouchableOpacity style={styles.botonAprobar} onPress={() => aprobarChofer(item.id)}>
                  <Text style={styles.botonAprobarTexto}>✅ Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarChofer(item.id, item.nombre_completo)}>
                  <Text style={styles.botonEliminarTexto}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vacio}>No hay solicitudes pendientes</Text>}
        />
      )}

      {pestanaActiva === 'activos' && (
        <FlatList
          data={choferesActivos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardChofer}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{item.nombre_completo}</Text>
                  <Text style={styles.cardChapa}>🚘 {item.chapa}</Text>
                </View>
                {item.foto_perfil_url && <Image source={{ uri: item.foto_perfil_url }} style={styles.cardAvatar} />}
              </View>
              <View style={styles.cardAcciones}>
                <TouchableOpacity style={styles.botonSuspender} onPress={() => suspenderChofer(item.id)}>
                  <Text style={styles.botonSuspenderTexto}>⏸️ Suspender</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarChofer(item.id, item.nombre_completo)}>
                  <Text style={styles.botonEliminarTexto}>🗑️ Eliminar</Text>
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