import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      console.error(error);
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(criteria: string) {
    let pokemon: Pokemon;

    // valida que sea un numero
    if (!isNaN(+criteria)) {
      pokemon = await this.pokemonModel.findOne({ no: criteria });
    }

    // Mongo ID
    if (!pokemon && isValidObjectId(criteria)) {
      pokemon = await this.pokemonModel.findById(criteria);
    }

    // name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: criteria });
    }

    if (!pokemon) throw new NotFoundException(`Pokemon ${criteria} not found`);

    return pokemon;
  }

  async update(criteria: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(criteria);

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      const updatedPokemon = await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if ( deletedCount === 0 ){
      throw new BadRequestException(`Pokemon with id "${ id }" not found`);
    }

    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000)
      throw new BadRequestException(
        `Pokemon already exists ${JSON.stringify(error.keyValue)}`,
      );
    console.error(error);
    throw new InternalServerErrorException(`Can't update database.`);
  }
}
