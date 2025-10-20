import { JsonProperty } from 'typescript-json-serializer';

export class PlanDTO {
  @JsonProperty({ name: 'planName', required: true })
  planName!: string;

  @JsonProperty({ name: 'planID', required: true })
  _id!: string;

  @JsonProperty({ name: 'planPrice', required: true })
  planPrice!: number;

  @JsonProperty({ name: 'planStorage', required: true })
  planStorage!: number;
}
