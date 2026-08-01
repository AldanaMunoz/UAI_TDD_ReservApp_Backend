ALTER TABLE `comidas_planificacion_semanal`
  ADD COLUMN `id_comida_postre` int DEFAULT NULL AFTER `id_comida_vegetariana`,
  ADD COLUMN `id_comida_bebida` int DEFAULT NULL AFTER `id_comida_postre`,
  ADD KEY `fk_comidas_plan_postre` (`id_comida_postre`),
  ADD KEY `fk_comidas_plan_bebida` (`id_comida_bebida`),
  ADD CONSTRAINT `fk_comidas_plan_postre` FOREIGN KEY (`id_comida_postre`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comidas_plan_bebida` FOREIGN KEY (`id_comida_bebida`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
