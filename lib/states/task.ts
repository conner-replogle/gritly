
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, Pressable } from "react-native";
import { Realm, RealmProvider, useRealm, useQuery } from '@realm/react'
import { ObjectSchema } from "realm";
import { differenceInDays } from "date-fns";

const UNITS = [
  {
    "name": "Custom",
    "value": "custom",
    "type": "count"
  },
  {
    "name": "Minutes",
    "value": "minutes",
    "type": "time"
  },
  {
    "name": "Hours",
    "value": "hours",
    "type": "time"
  },
  {
    "name": "Yards",
    "value": "yards",
    "type": "length"
  },
  {
    "name": "Miles",
    "value": "miles",
    "type": "length"
  },
  {
    "name": "Count",
    "value": "count",
    "type": "count"
  },
  
]

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
    id!: string;
    completedAt!: Date;
    amount: number = 0;
    goal!: Goal;
    isCompleted(): boolean{
      return this.amount >= this.goal.amount;
    } 

    static schema: Realm.ObjectSchema = {
      name: 'Completed',
      embedded: true,
      properties: {
        id: 'string',
        completedAt: 'date',
        amount: 'int',
        goal: 'Goal'
      },
    };
}

class Goal extends Realm.Object {
  amount!: number;
  unit!: string;
  steps!: number;
  customName?: string;

  static schema: Realm.ObjectSchema = {
    name: 'Goal',
    embedded: true,
    properties: {
      amount: "int",
      unit: "string",
      customName: "string?",
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
    goal!:Goal;

    static generate(title: string,description: string,repeats: Repeat,goal?:Goal) {
      let startsOn = new Date(Date.now());
      startsOn.setHours(0,0,0,0);
        return {
        _id: new Realm.BSON.ObjectId(),
        title,
        description,
        completed:[],
        repeats,
        goal: goal ?? {
          amount: 1,
          unit: "count",
          steps: 1
        },
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
      }else if (this.repeats.period == "Weekly"){
        return true;
      }
      return false;                      
    }
    

    getCompleted(date: Date): Completed | undefined{
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
          return this.completed[i];
      } 
      return undefined;
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
export {Task,Repeat,Completed,Goal,UNITS}