import { Controller, Param, UseGuards, Patch, Body, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    const user = await this.usersService.update(id, updateData);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { password, ...userData } = user.toObject();
    return userData;
  }
}
