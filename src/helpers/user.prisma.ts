import { prisma } from "../config/env";

export const getUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        select: {
            id: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
            isVerified: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
        },
        where: {
            email,
        },
    });
};

// export const getNewUserName = async (firstName?: string, userName?: string) => {
//     let newUserName = "";

//     if (userName) {
//         newUserName = userName.trim().toLowerCase().replace(/\s+/g, "_");
//     } else if (
//         firstName &&
//         firstName.trim().toLowerCase().replace(/\s+/g, "_") !== ""
//     ) {
//         // Ubah ke lowercase dan ganti spasi jadi underscore
//         newUserName = `${firstName
//             .toLowerCase()
//             .replace(/\s+/g, "_")}${Math.floor(Math.random() * 9999)}`;
//     } else {
//         // Fallback kalau firstName dan userName kosong
//         newUserName = `user_${Math.floor(Math.random() * 9999)}`;
//     }

//     // Check apakah username sudah ada di database
//     const checkUserName = await prisma.user.findUnique({
//         where: { userName: newUserName },
//     });

//     if (checkUserName) {
//         throw new Error("Username already exists. Please choose another one.");
//     }

//     return newUserName;
// };

export const getUserForResetPassword = async (email: string) => {
    return await prisma.user.findUnique({
        select: {
            id: true,
            email: true,
            firstName: true,
            password: true,
            isActive: true,
        },
        where: {
            email,
        },
    });
};

export const getUserForDeactivate = async (id: string) => {
    return await prisma.user.findUnique({
        select: {
            id: true,
            isActive: true,
        },
        where: {
            id,
        },
    });
};
