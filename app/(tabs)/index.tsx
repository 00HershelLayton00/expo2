// app/index.tsx
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🚖 Cuber Holguín</Text>
        <Text style={styles.subtitulo}>Transporte seguro y confiable</Text>
      </View>

      <View style={styles.botonesContainer}>
        <Link href="/cartas-holguin" asChild>
          <TouchableOpacity style={styles.botonPrincipal}>
            <Text style={styles.iconoGrande}>🚗</Text>
            <Text style={styles.botonPrincipalTexto}>Buscar Chofer</Text>
            <Text style={styles.botonDescripcion}>Encuentra transporte para tus viajes</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin" asChild>
          <TouchableOpacity style={styles.botonAdmin}>
            <Text style={styles.iconoChico}>🔐</Text>
            <Text style={styles.botonAdminTexto}>Panel Administrador</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTexto}>© 2026 Cuber Holguín - Todos los derechos reservados</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F4F8',
    justifyContent: 'space-between'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: '#128C7E',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  titulo: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: 'white',
    marginBottom: 8
  },
  subtitulo: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  botonesContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  botonPrincipal: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconoGrande: {
    fontSize: 50,
    marginBottom: 10,
  },
  botonPrincipalTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#128C7E',
    marginBottom: 5,
  },
  botonDescripcion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  botonAdmin: {
    backgroundColor: '#37474F',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconoChico: {
    fontSize: 20,
  },
  botonAdminTexto: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerTexto: {
    fontSize: 12,
    color: '#999',
  }
});