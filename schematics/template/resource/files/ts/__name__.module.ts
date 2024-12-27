import { DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';
<% if (type === 'rest' || type === 'microservice') { %>import { <%= classify(name) %>Controller } from './<%= name %>.controller';<% } %><% if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';<% } %><% if (type === 'ws') { %>import { <%= classify(name) %>Gateway } from './<%= name %>.gateway';<% } %>
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';
import { <%= classify(name) %>Service } from './<%= name %>.service';

@Module({
  imports: [TypeOrmModule.forFeature([<%= singular(classify(name)) %>])],
  providers: [<%= classify(name) %>Service],
})
export class <%= classify(name) %>Module {
  static forRoot(options?: { controller?: boolean, repoOnly?: boolean }): DynamicModule {
    // get controller and everything
    if (options?.controller) {
      return {
        module: <%= classify(name) %>Module,
        controllers: [<%= classify(name) %>Controller],
        providers: [<%= classify(name) %>Service],
      }
    }
    // Get Repository only
    if (options?.repoOnly) {
      return {
        module: <%= classify(name) %>Module,
        providers: [],
        exports: [TypeOrmModule],
      }
    }
    // By default get service only
    return {
      module: <%= classify(name) %>Module,
      providers: [<%= classify(name) %>Service],
      exports: [<%= classify(name) %>Service],
    }
  }
}

<%
// vim: ft=template
%>
