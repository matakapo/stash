import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import * as GQL from "src/core/generated-graphql";
import { NavUtils, TextUtils } from "src/utils";

interface IPerformerCardProps {
  performer: GQL.PerformerDataFragment;
  ageFromDate?: string;
}

export const PerformerCard: React.FC<IPerformerCardProps> = ({
  performer,
  ageFromDate,
}) => {
  const age = TextUtils.age(performer.birthdate, ageFromDate);
  const ageString = `${age} years old${ageFromDate ? " in this scene." : "."}`;

  function maybeRenderFavoriteBanner() {
    if (performer.favorite === false) {
      return;
    }
    return <div className="rating-banner rating-5">FAVORITE</div>;
  }

  return (
    <Card className="performer-card">
      <Link to={`/performers/${performer.id}`}>
        <img
          className="image-thumbnail card-image"
          alt={performer.name ?? ""}
          src={performer.image_path ?? ""}
        />
        {maybeRenderFavoriteBanner()}
      </Link>
      <div className="card-section">
        <h5 className="text-truncate">{performer.name}</h5>
        {age !== 0 ? <div className="text-muted">{ageString}</div> : ""}
        <div className="text-muted">
          Stars in {performer.scene_count}{" "}
          <Link to={NavUtils.makePerformerScenesUrl(performer)}>scenes</Link>.
        </div>
      </div>
    </Card>
  );
};
