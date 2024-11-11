import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AvatarService } from '../services/avatar.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  profile: any=null;  // Inicializamos el perfil como 'null'

  constructor(
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.loadUserProfile();
  }

  // Método para cargar el perfil del usuario
  loadUserProfile() {
    this.avatarService.getUserProfile()?.subscribe(
      (data) => {
        if (data) {
          console.log('User profile loaded:');
          this.profile=data;  // Solo asignamos los datos si 'data' no es null
        } else {
          console.log('No user profile found');
          // Aquí puedes manejar el caso cuando no haya un perfil, por ejemplo, redirigir a login
        }
      },
      (error) => {
        console.error('Error loading user profile:', error);
        // Aquí puedes manejar cualquier error que ocurra al intentar obtener el perfil
      }
    );
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  async changeImage() {
    const image=await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos // Camera, Photos or Prompt!
    });

    if (image) {
      const loading=await this.loadingController.create();
      await loading.present();

      const result=await this.avatarService.uploadImage(image);
      loading.dismiss();

      if (!result) {
        const alert=await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your avatar.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }
}
