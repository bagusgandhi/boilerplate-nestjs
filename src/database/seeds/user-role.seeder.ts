// import { Seeder, SeederFactoryManager } from 'typeorm-extension';
// import { DataSource } from 'typeorm';
// import { User } from 'src/modules/user/entities/user.entity';
// import { Role } from 'src/modules/role/entities/role.entity';
// import * as bcrypt from 'bcrypt';

// export default class UserRoleSeeder implements Seeder {
//   public async run(
//     dataSource: DataSource,
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     factoryManager: SeederFactoryManager,
//   ): Promise<void> {
//     // await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');

//     const userRepository = dataSource.getRepository(User);
//     const roleRepository = dataSource.getRepository(Role);

//     const salt = await bcrypt.genSalt();

//     const userInsertResult = await userRepository.insert({
//       email: 'admin@bagusgandhi.web.id',
//       name: 'Admin Gandhi',
//       salt,
//       password: await bcrypt.hash('pass123!@#', salt),
//     });

//     const roleInsertResult = await roleRepository.insert({
//       name: 'superadmin',
//     });

//     // Retrieve the newly created user and role entities
//     const newUser = await userRepository.findOneBy({
//       id: userInsertResult.identifiers[0].id,
//     });
//     const newRole = await roleRepository.findOneBy({
//       id: roleInsertResult.identifiers[0].id,
//     });

//     if (newUser && newRole) {
//       // Assign the role to the user
//       newUser.roles = [newRole];
//       await userRepository.save(newUser);
//     }
//   }
// }
