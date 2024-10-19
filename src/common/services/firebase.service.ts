import { Injectable } from '@nestjs/common';
import { bucket } from 'src/common/firebase/firebase.config'; // Importa el bucket inicializado en tu config
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseService{
    
/**
   * Sube un archivo a Firebase Storage.
   * @param file El archivo que se va a subir.
   * @param folder La carpeta dentro del bucket de Firebase donde se guardará el archivo.
   * @returns URL pública del archivo subido.
   */
async uploadFile(file: Express.Multer.File, folder: string): Promise<{ fileName: string, publicUrl: string}> {
  try {
    const extension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}_${Date.now()}.${extension}`;
    const filePath = `${folder}/${fileName}`;
    const fileUpload = bucket.file(filePath);

    // Aquí el archivo debe pasarse como un buffer
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: true,  // Hacer el archivo público
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      return {
        fileName: fileName,
        publicUrl: publicUrl
      };
  } catch (error) {
    console.error('Error al subir archivo a Firebase:', error);
    throw new Error('Error al subir archivo a Firebase');
  }
}
  
    /**
     * Elimina un archivo de Firebase Storage.
     * @param filePath Ruta completa del archivo a eliminar (incluyendo el nombre y carpeta).
     */
    async deleteFile(filePath: string): Promise<void> {
      try {
        const file = bucket.file(filePath);
        await file.delete();
        console.log(`Archivo ${filePath} eliminado correctamente.`);
      } catch (error) {
        console.error('Error al eliminar archivo de Firebase:', error);
        throw new Error('Error al eliminar archivo de Firebase');
      }
    }
  }