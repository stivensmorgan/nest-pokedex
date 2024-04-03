import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ) {}

  async executeSeed() {

    // delete all records
    await this.pokemonModel.deleteMany();

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // 1. Forma de varias inserciones asyncronas
    /*
    const insertPromises = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[ segments.length - 2 ]; //penultima posicion es el número

      //const pokemon = await this.pokemonModel.create({ name, no });
      insertPromises.push( this.pokemonModel.create({ name, no }) );

    });

    await Promise.all( insertPromises );
    */

    // 2. Forma de 1 insert de arreglos mas eficiente
    const pokemonToInsert: {name: string, no: number}[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2]; //penultima posicion es el número

      pokemonToInsert.push({ name, no });

    });
    this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed Executed!!!';
  }
}
