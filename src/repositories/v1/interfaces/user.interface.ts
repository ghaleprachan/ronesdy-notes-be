import { UserDTO } from '../../../dto/v1/common/user.dto';

export interface IUserRepository {
  create(userData: UserDTO): Promise<UserDTO>;
  findByEmail(email: string): Promise<UserDTO | []>;
}
