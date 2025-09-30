// Proxy file para importar las funciones de shared-firebase
// Este archivo actúa como un puente entre el módulo compartido y la aplicación web

// Importamos del módulo compartido utilizando la configuración de paths
import { 
  createCustomerWithDNI as createCustomer,
  reassignDNIByAdmin as reassignDNI,
  getCustomerByDNI as getCustomer,
  releaseDNIByAdmin as releaseDNI
} from 'shared-firebase';

// Re-exportamos con los mismos nombres para usarlos en la aplicación web
export const createCustomerWithDNI = createCustomer;
export const reassignDNIByAdmin = reassignDNI;
export const getCustomerByDNI = getCustomer;
export const releaseDNIByAdmin = releaseDNI;