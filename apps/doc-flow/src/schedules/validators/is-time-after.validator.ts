import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsTimeAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTimeAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          
          if (!value || !relatedValue) {
            return true;
          }
          
          const time1 = new Date(`1970-01-01T${relatedValue}:00`);
          const time2 = new Date(`1970-01-01T${value}:00`);
          
          return time2 > time1;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        }
      }
    });
  };
} 
 