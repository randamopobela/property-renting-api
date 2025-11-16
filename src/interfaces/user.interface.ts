// Interface untuk UserRegister
export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    address?: string;
    profilePicture: string;
}

export interface IUserLogin extends IUser {
    password?: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserResetPassword {
    id: string;
    email: string;
    firstName: string;
    password?: string;
    isActive: boolean;
}

export interface IUserDeactivate {
    id: string;
    isActive: boolean;
}
