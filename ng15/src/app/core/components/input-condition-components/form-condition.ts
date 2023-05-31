export class FormConditionItem {
  public type: string = undefined;
  public key: string = undefined;
  public description: string = undefined;
  public enabled: boolean = undefined;
  static selectId: (item: FormConditionItem) => string = (item) =>
    item.type + item.key + item.description + item.enabled;
}
export class FormCondition {
  public id: string = undefined;
  public items: FormConditionItem[] = undefined;
  static selectId: (item: FormCondition) => string = (item) => item.id;
}
