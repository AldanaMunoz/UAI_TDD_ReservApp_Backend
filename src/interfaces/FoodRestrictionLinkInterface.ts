export interface IFoodRestrictionLink {
  id?: number;
  foodId: number; // id_comida
  restrictionId: number; // id_comida_restriccion
}

/** Para listar lindo (con joins) */
export interface IFoodRestrictionLinkView extends IFoodRestrictionLink {
  foodName?: string;
  restrictionName?: string;
}
