export type CreateUserDTO = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  password: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type AuthResponse = {
  email: string;
  username: string;
  authToken: string;
  roles: string[];
};
