import { JsonSerializer } from 'typescript-json-serializer';

export function deserializeToDTO(
    data: any,
    DTOClass: any,
  ): any {
    const  deSerializer = new JsonSerializer();
    if (data === null) {
        throw new Error('Invalid data for deserialization');
      }
    const response = deSerializer.deserializeObject(data, DTOClass);
    return response;
  }