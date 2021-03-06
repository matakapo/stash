import React from "react";
import _ from "lodash";
import { useHistory } from "react-router-dom";
import {
  FindScenesQueryResult,
  SlimSceneDataFragment,
} from "src/core/generated-graphql";
import { StashService } from "src/core/StashService";
import { useScenesList } from "src/hooks";
import { ListFilterModel } from "src/models/list-filter/filter";
import { DisplayMode } from "src/models/list-filter/types";
import { WallPanel } from "../Wall/WallPanel";
import { SceneCard } from "./SceneCard";
import { SceneListTable } from "./SceneListTable";
import { SceneSelectedOptions } from "./SceneSelectedOptions";

interface ISceneList {
  subComponent?: boolean;
  filterHook?: (filter: ListFilterModel) => ListFilterModel;
}

export const SceneList: React.FC<ISceneList> = ({
  subComponent,
  filterHook,
}) => {
  const history = useHistory();
  const otherOperations = [
    {
      text: "Play Random",
      onClick: playRandom,
    },
  ];

  const listData = useScenesList({
    zoomable: true,
    otherOperations,
    renderContent,
    renderSelectedOptions,
    subComponent,
    filterHook,
  });

  async function playRandom(
    result: FindScenesQueryResult,
    filter: ListFilterModel
  ) {
    // query for a random scene
    if (result.data && result.data.findScenes) {
      const { count } = result.data.findScenes;

      const index = Math.floor(Math.random() * count);
      const filterCopy = _.cloneDeep(filter);
      filterCopy.itemsPerPage = 1;
      filterCopy.currentPage = index + 1;
      const singleResult = await StashService.queryFindScenes(filterCopy);
      if (
        singleResult &&
        singleResult.data &&
        singleResult.data.findScenes &&
        singleResult.data.findScenes.scenes.length === 1
      ) {
        const { id } = singleResult!.data!.findScenes!.scenes[0];
        // navigate to the scene player page
        history.push(`/scenes/${id}?autoplay=true`);
      }
    }
  }

  function renderSelectedOptions(
    result: FindScenesQueryResult,
    selectedIds: Set<string>
  ) {
    // find the selected items from the ids
    if (!result.data || !result.data.findScenes) {
      return undefined;
    }

    const { scenes } = result.data.findScenes;

    const selectedScenes: SlimSceneDataFragment[] = [];
    selectedIds.forEach((id) => {
      const scene = scenes.find((s) => s.id === id);

      if (scene) {
        selectedScenes.push(scene);
      }
    });

    return (
      <>
        <SceneSelectedOptions
          selected={selectedScenes}
          onScenesUpdated={() => {}}
        />
      </>
    );
  }

  function renderSceneCard(
    scene: SlimSceneDataFragment,
    selectedIds: Set<string>,
    zoomIndex: number
  ) {
    return (
      <SceneCard
        key={scene.id}
        scene={scene}
        zoomIndex={zoomIndex}
        selected={selectedIds.has(scene.id)}
        onSelectedChanged={(selected: boolean, shiftKey: boolean) =>
          listData.onSelectChange(scene.id, selected, shiftKey)
        }
      />
    );
  }

  function renderContent(
    result: FindScenesQueryResult,
    filter: ListFilterModel,
    selectedIds: Set<string>,
    zoomIndex: number
  ) {
    if (!result.data || !result.data.findScenes) {
      return;
    }
    if (filter.displayMode === DisplayMode.Grid) {
      return (
        <div className="row justify-content-center">
          {result.data.findScenes.scenes.map((scene) =>
            renderSceneCard(scene, selectedIds, zoomIndex)
          )}
        </div>
      );
    }
    if (filter.displayMode === DisplayMode.List) {
      return <SceneListTable scenes={result.data.findScenes.scenes} />;
    }
    if (filter.displayMode === DisplayMode.Wall) {
      return <WallPanel scenes={result.data.findScenes.scenes} />;
    }
  }

  return listData.template;
};
