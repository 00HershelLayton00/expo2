import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { ChoferForm } from '../../../components/admin/ChoferForm';
import { supabase } from '../../../lib/supabase/client';

export default function CrearChofer() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
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
      condiciones: { horario_habitual: formData.horario_habitual, notas_extra: formData.notas_extra },
      foto_perfil_url: formData.foto_perfil_url,
      foto_carro_url: formData.foto_carro_url,
    };

    try {
      if (id) {
        await supabase.from('choferes').update(payload).eq('id', id);
      } else {
        await supabase.from('choferes').insert([{ ...payload, estado_suscripcion: 'pendiente' }]);
      }
      Alert.alert('✅ Éxito', id ? 'Chofer actualizado' : 'Chofer creado');
      router.back();
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return <ChoferForm onSubmit={handleSubmit} loading={loading} />;
}
