import { Profile } from '@/models/profile';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

// Define un tipo para los datos que se pueden actualizar en el perfil.
// Usamos `Partial<Profile>` para indicar que no todos los campos son necesarios en una actualización.
// Puedes ser más específico si quieres (ej. solo `name` y `email`).
type UpdateProfileData = Partial<Pick<Profile, 'name' | 'email'>>;

interface UpdatePasswordData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export const ProfileService = {
    /**
     * Obtiene los datos del perfil del usuario autenticado.
     */
    async get(): Promise<Profile> {
        const { data } = await api.get<Profile>(API_ENDPOINTS.PROFILE);
        return data;
    },

    /**
     * Actualiza los datos del perfil del usuario autenticado.
     * @param profileData - Un objeto con los campos del perfil a actualizar.
     */
    async update(profileData: UpdateProfileData): Promise<Profile> {
        // La ruta RESTful para actualizar el perfil del usuario actual no necesita un ID.
        // El backend identifica al usuario a través del token de autenticación.
        // Usamos PUT o POST. PUT es común, pero POST es mejor si incluyes subida de archivos (foto).
        const { data } = await api.put<Profile>(API_ENDPOINTS.PROFILE, profileData); 
        // Nota: Laravel a menudo prefiere POST para actualizaciones para evitar problemas con `form-data`.
        return data;
    },

    /**
     * Actualiza la foto de perfil del usuario.
     * Se recomienda un método separado para la subida de archivos.
     * @param formData - Un objeto FormData que contiene el archivo de imagen.
     */
    async updateProfilePicture(formData: FormData): Promise<Profile> {
        const { data } = await api.post<Profile>(API_ENDPOINTS.UPDATE_PICTURE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    /**
     * Actualiza la contraseña del usuario autenticado.
     * @param passwordData - Objeto con la contraseña actual y la nueva contraseña con su confirmación.
     */
    async updatePassword(passwordData: UpdatePasswordData): Promise<void> {
        // Usamos un endpoint dedicado. PUT es semánticamente correcto aquí.
        await api.post(API_ENDPOINTS.UPDATE_PASSWORD, passwordData);
    },

    /**
     * Solicita la eliminación de la cuenta del usuario.
     * Esta es una acción destructiva y generalmente requiere la contraseña actual.
     * @param password - La contraseña actual del usuario para confirmar la eliminación.
     */
    async deleteAccount(password: string): Promise<void> {
        // El endpoint debería ser específico para esta acción, por ejemplo: /user/delete-account
        // Usamos POST porque estamos enviando datos (la contraseña) para realizar la acción.
        await api.post(API_ENDPOINTS.DELETE_ACCOUNT, { current_password: password });
    },
};