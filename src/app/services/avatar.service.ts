import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadString } from '@angular/fire/storage';
import { Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) { }

  // Método para obtener el perfil de usuario
  getUserProfile() {
    const user=this.auth.currentUser;
    // Verificamos si 'user' existe
    if (!user) {
      console.error('No user is logged in');
      return null; // Retornamos null si no hay usuario
    }

    const userDocRef=doc(this.firestore, `users/${user.uid}`);
    return docData(userDocRef, { idField: 'id' });
  }

  // Método para subir una imagen al almacenamiento
  async uploadImage(cameraFile: Photo) {
    const user=this.auth.currentUser;

    // Verificamos si el usuario está logueado
    if (!user?.uid) {
      console.error('No user is logged in or user UID is missing');
      return null; // Retornamos null si no hay usuario o UID
    }

    const path=`uploads/${user.uid}/profile.webp`;  // Ruta para guardar la imagen
    const storageRef=ref(this.storage, path);

    // Verificamos si el archivo tiene una cadena base64
    if (!cameraFile.base64String) {
      console.error('No base64 string found for the image');
      return null;  // Retornamos null si no hay cadena base64
    }

    try {
      // Subimos la imagen
      await uploadString(storageRef, cameraFile.base64String, 'base64');

      // Obtenemos la URL de la imagen subida
      const imageUrl=await getDownloadURL(storageRef);

      // Actualizamos el documento del usuario con la URL de la imagen
      const userDocRef=doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, {
        imageUrl
      }, { merge: true });  // Usamos merge para no sobrescribir otros campos

      return true;  // Imagen subida con éxito
    } catch (e) {
      console.error(e);
      return null;  // En caso de error
    }
  }
}
