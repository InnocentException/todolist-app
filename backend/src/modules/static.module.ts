import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, resolve } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(
        resolve(),
        '../frontend/dist/frontend/browser',
      ),
    }),
  ],
  controllers: [],
  providers: [],
  exports: [ServeStaticModule],
})
export class StaticModule {}
