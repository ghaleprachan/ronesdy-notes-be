import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { PlanDTO } from '../../../common/plan.dto';

@JsonObject()
export class GetUserCloudStorageResponseDTO {
  @JsonProperty({ name: 'allocatedStorage' })
  allocatedStorage?: number;

  @JsonProperty({ name: 'usedStorage' })
  usedStorage?: number;

  @JsonProperty({ name: 'currentPlan' })
  currentPlan?: PlanDTO;

  @JsonProperty({ name: 'otherPlans' })
  otherPlans?: PlanDTO[];

  constructor(userDetails: any, currentPlan?: PlanDTO, otherPlans?: PlanDTO[]) {
    this.allocatedStorage = userDetails.allocatedStorage;
    this.usedStorage = userDetails.usedStorage;
    this.currentPlan = currentPlan;
    this.otherPlans = otherPlans;
  }
}
