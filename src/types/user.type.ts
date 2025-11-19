import { User } from "../generated/prisma";

type TUser = Omit<User, "password"> | undefined;

export default TUser;
