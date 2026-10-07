import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGoogleDto {
  // ID token que entrega Google Identity Services al frontend.
  @IsString()
  @IsNotEmpty()
  credential: string;
}
