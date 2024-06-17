
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, Pressable } from "react-native";
import { Realm, RealmProvider, useRealm, useQuery } from '@realm/react'
import { ObjectSchema } from "realm";
import { differenceInDays } from "date-fns";


class Repeat extends Realm.Object {
    period!: string;
    
    specfic_weekday?: Realm.Set<number> | number[];
    specfic_days?: Realm.Set<number> | number[];
    every_n?: number;

    static schema: Realm.ObjectSchema = {
      name: 'Repeat',
      embedded: true,
      properties: {
        period: 'string',
        specfic_weekday: 'int<>', // Set of integers
        specfic_days: 'int<>',
        every_n: 'int?'
      },
    };
  }
class Completed extends Realm.Object {
    completedAt!: Date;
    static schema: Realm.ObjectSchema = {
      name: 'Completed',
      embedded: true,
      properties: {
        completedAt: 'date'
      },
    };
}

class Goal extends Realm.Object {
  amount!: number;
  unit!: string;
  steps!: number;

  static schema: Realm.ObjectSchema = {
    name: 'Goal',
    embedded: true,
    properties: {
      amount: "int",
      unit: "string",
      steps: "int"
    },
  };
}
class Task extends Realm.Object {
    _id!: Realm.BSON.ObjectId;
    title!: string;
    repeats!: Repeat;
    description!: string;
    completed!:Completed[]
    createdAt!: Date;
    startsOn!: Date;
    goal:Goal | undefined;

    static generate(title: string,description: string,repeats: Repeat) {
      let startsOn = new Date(Date.now());
      startsOn.setHours(0,0,0,0);
        return {
        _id: new Realm.BSON.ObjectId(),
        title,
        description,
        completed:[],
        repeats,
        createdAt: new Date(Date.now()),
        startsOn:startsOn
        };
    }
    

    showToday(date:Date):boolean{
      if (this.repeats.period == "Daily"){
        if (this.repeats.specfic_days && this.repeats.specfic_days.includes(date.getDate()))
          return true;
        if (this.repeats.every_n && differenceInDays(this.startsOn,date) % this.repeats.every_n == 0)
          return true;
        if (this.repeats.specfic_weekday && this.repeats.specfic_weekday.includes(date.getDay()))
          return true;
      }
      return false;                      
    }
    

    isCompleted(date: Date): boolean{
      const beginning = new Date(date);
      const end = new Date(date);
      const MorningStart = 8;
      const WeekStart = 2 // Monday

      if (this.repeats.period == "weekly"){
        const currentDay = beginning.getDay();
        const difference = (currentDay - WeekStart + 7) % 7;
        
        beginning.setDate(beginning.getDate() - difference);
        end.setDate(end.getDate() + (6 - difference));
      }else if (this.repeats.period  == "daily"){
        end.setDate(end.getDate() + 1);
      }
      beginning.setHours(0,0,0,0)
      end.setHours(23,59,59,0);

      
      for (let i = this.completed.length - 1; i >= 0; i--){

        if (this.completed[i].completedAt >= beginning && this.completed[i].completedAt <= end)
          return true;
      } 
      return false;
    }

    static schema = {
        name: 'Task',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            title: 'string',
            description: 'string',
            completed:"Completed[]",
            repeats: "Repeat",
            goal: "Goal",
            createdAt: 'date',
            startsOn: 'date'
        },
    } as ObjectSchema;
}
export {Task,Repeat,Completed,Goal}