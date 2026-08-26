import React from "react";

function EverythingCard(props) {
  const handleClick = (e) => {
    // If the user clicks the source link,
    // allow the link to work normally.
    if (e.target.closest("a")) {
      return;
    }

    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div
      className="everything-card mt-20"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="everything-card flex flex-wrap p-5 gap-1 mb-1">
        <b className="title">
          {props.title}
        </b>

        <div className="everything-card-img mx-auto">
          <img
            className="everything-card-img"
            src={props.imgUrl}
            alt={props.title || "News"}
          />
        </div>

        <div className="description">
          <p className="description-text leading-7">
            {props.description
              ? props.description.substring(0, 200)
              : ""}
          </p>
        </div>

        <div className="info">
          <div className="source-info flex items-center gap-2">
            <span className="font-semibold">
              Source:
            </span>

            <a
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link underline break-words"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {typeof props.source === "object"
                ? props.source?.name || "Unknown"
                : props.source || "Unknown"}
            </a>
          </div>

          <div className="origin flex flex-col">
            <p className="origin-item">
              <span className="font-semibold">
                Author:
              </span>{" "}
              {props.author || "Unknown"}
            </p>

            <p className="origin-item">
              <span className="font-semibold">
                Published At:
              </span>{" "}
              {props.publishedAt || "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EverythingCard;
