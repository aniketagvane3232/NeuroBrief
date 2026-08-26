import React, { useState } from "react";

function EverythingBookCard(props) {
  // State for likes and rating
  const [likes, setLikes] = useState(0);
  const [rating, setRating] = useState(0);

  // Function to handle like button click
  const handleLike = () => {
    setLikes(likes + 1);
  };

  // Function to handle rating click
  const handleRating = (newRating) => {
    setRating(newRating);
  };

return (
    <div className="everything-card mt-10" onClick={props.onClick} style={{ cursor: 'pointer', maxWidth: '400px' }}>
        <div className="everything-card flex flex-wrap p-5 gap-1 mb-1">
            <b className="title text-md">{props.title}</b>
            <div className="everything-card-img mx-auto">
                <img className="everything-card-img" src={props.imgUrl} alt="img" style={{ maxHeight: '150px' }} />
            </div>
            <div className="description">
                <p className="description-text leading-5 text-sm">
                    {props.description?.substring(0, 100)} {/* Truncate description */}
                </p>
            </div>
            <div className="info">
                <div className="source-info flex items-center gap-1 text-sm">
                    <span className="font-semibold">Source:</span>
                    <a
                        href={props.url}
                        target="_blank"
                        className="link underline break-words"
                        rel="noopener noreferrer" // Recommended for security
                    >
                        {props.source.substring(0, 50)}
                    </a>
                </div>
                <div className="origin flex flex-col text-sm">
                    <p className="origin-item">
                        <span className="font-semibold">Author:</span>
                        {props.author}
                    </p>
                    <p className="origin-item flex-col text-sm">
                        <span className="font-semibold">Published At:</span>
                        ({props.publishedAt})
                    </p>
                </div>
            </div>
        </div>

        {/* Additional Card Content */}
        <div className="flex lg:flex-row mt-2">
            <div
                className="h-24 lg:h-auto lg:w-24 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
                style={{ backgroundImage: `url(${props.imageUrlLeft})` }}
                title={props.imageLeftTitle}
            ></div>
            <div className="border rounded-b lg:rounded-b-none lg:rounded-r p-2 flex flex-col justify-between leading-normal">
                <div className="mb-4">
                    <p className="text-xs text-gray-600 flex items-center">
                        {props.memberIcon && (
                            <svg
                                className="fill-current text-gray-500 w-2 h-2 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                {props.memberIcon}
                            </svg>
                        )}
                        {props.memberText}
                    </p>
                    <div className="text-gray-900 font-bold text-sm mb-1">
                        {props.cardTitle}
                    </div>
                    <p className="text-gray-700 text-xs">{props.cardDescription}</p>
                </div>
                <div className="flex items-center">
                    {props.authorImage && (
                        <img
                            className="w-6 h-6 rounded-full mr-2"
                            src={props.authorImage}
                            alt="Avatar"
                        />
                    )}
                    <div className="text-xs">
                        <p className="text-gray-900 leading-none">{props.authorName}</p>
                        <p className="text-gray-600">{props.publishedDate}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default EverythingBookCard;
