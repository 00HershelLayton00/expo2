// styles/adminStyles.ts
import { StyleSheet } from 'react-native';

export const adminStyles = StyleSheet.create({
  // Login
  loginContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: '#128C7E' 
  },
  tituloLogin: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: 'white', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  input: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 18, 
    textAlign: 'center' 
  },
  botonLogin: { 
    backgroundColor: '#25D366', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 20 
  },
  botonLoginTexto: { 
    color: 'white', 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  botonVolver: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  botonVolverTexto: { 
    color: 'white', 
    fontSize: 16 
  },

  // Container Principal
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  centrado: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerAdmin: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  tituloAdmin: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#128C7E' 
  },
  cerrarSesion: { 
    color: '#F44336', 
    fontWeight: '600' 
  },

  // Pestañas
  pestanasContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    paddingHorizontal: 10, 
    paddingVertical: 10 
  },
  pestana: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent' 
  },
  pestanaActiva: { 
    borderBottomColor: '#128C7E' 
  },
  pestanaTexto: { 
    fontSize: 14, 
    color: '#666' 
  },

  // Formulario
  formContainer: { 
    padding: 20 
  },
  formTitulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#128C7E'
  },
  fotoButton: { 
    height: 120, 
    backgroundColor: '#EEE', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#128C7E',
    borderStyle: 'dashed'
  },
  fotoPreview: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 8 
  },
  formInput: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#DDD' 
  },
  label: { 
    fontWeight: '600', 
    marginBottom: 5,
    color: '#333'
  },
  checkRow: { 
    flexDirection: 'row', 
    gap: 20, 
    marginBottom: 15,
    flexWrap: 'wrap'
  },
  botonGuardar: { 
    backgroundColor: '#128C7E', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  botonGuardarTexto: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  // Tarjetas de Chofer
  cardChofer: { 
    backgroundColor: 'white', 
    marginHorizontal: 15, 
    marginTop: 15, 
    padding: 15, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  cardInfo: { 
    flex: 1 
  },
  cardNombre: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  cardChapa: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4 
  },
  cardCobertura: { 
    fontSize: 13, 
    color: '#128C7E', 
    marginTop: 4 
  },
  cardAvatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30 
  },
  cardAcciones: { 
    flexDirection: 'row', 
    marginTop: 15, 
    gap: 10 
  },
  botonAprobar: { 
    flex: 1, 
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  botonAprobarTexto: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  botonSuspender: { 
    flex: 1, 
    backgroundColor: '#FF9800', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  botonSuspenderTexto: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  botonEliminar: { 
    flex: 1, 
    backgroundColor: '#F44336', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  botonEliminarTexto: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  vacio: { 
    textAlign: 'center', 
    padding: 40, 
    color: '#999', 
    fontSize: 16 
  }
});