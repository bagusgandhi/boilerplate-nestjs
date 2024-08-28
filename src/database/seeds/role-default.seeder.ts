import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from 'src/modules/role/entities/role.entity';

export default class RoleDefaultSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');

    const roleRepository = dataSource.getRepository(Role);

    await roleRepository.insert({
      name: 'user',
    });

  }
}
