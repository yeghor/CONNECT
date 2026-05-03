import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import PostComments from "./post/postComments/postComments.tsx"

import { getCookieTokens } from "../../helpers/cookies/cookiesHandler.ts";
import { LoadPostResponseInterface, LoadPostResponse, SuccessfulResponse } from "../../fetching/DTOs.ts";
import { fetchDeletePost, fetchLikePost, fetchLoadPost, fetchUnlikePost } from "../../fetching/fetchSocial.ts";

import { safeAPICallPrivate, safeAPICallPublic } from "../../fetching/fetchUtils.ts";
import MakePost from "./post/makePost.tsx";
import { homeURI, loginURI, specificPostURI } from "../../consts.ts";
import PostOwnerComponent from "./post/owner.tsx";
import ActivePicture from "../base/activePictureModal.tsx";
import ConfirmModal from "../base/confirmModal.tsx";

const PostPage = () => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);

    const location = useLocation();
    const { postId } = useParams();

    const [ liked, toggleLikes ] = useState(false);
    const [ likeTimeout, setLikeTimeout ] = useState(false);

    const [ postData, setPostData ] = useState<LoadPostResponseInterface | undefined>(undefined);

    const [ activePostPictureURL, setActivePostPictureURL ] = useState<string | null>(null);
    const [ isMenuOpen, setMenuOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [ showDeletePostConfirmModal, setShowDeletePostConfirmModal ] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const handleDeletePost = async () => {
        await safeAPICallPrivate(tokens, fetchDeletePost, navigate, undefined, postId);
        navigate(homeURI);
    };

    const closeActiveImage = () => {
        setActivePostPictureURL(null)
    };

    const likeAction = async () => {
        if (postData && !likeTimeout) {
            setLikeTimeout(true);
            if (liked) {
                postData.likes -= 1;
                postData.isLiked = false;
                toggleLikes(postData.isLiked);
                await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchUnlikePost, navigate, undefined, postId);
            } else {
                postData.likes += 1;
                postData.isLiked = true;
                toggleLikes(postData.isLiked);
                await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchLikePost, navigate, undefined, postId);
            }
            setTimeout(() => setLikeTimeout(false), 200);
        }
    }

    useEffect(() => {
        const postFetcher = async (): Promise<void> => {
                const response = await safeAPICallPublic<LoadPostResponse>(
                    tokens,
                    fetchLoadPost,
                    navigate,
                    undefined,
                    postId
                );

                if(response.success) {
                    setPostData(response.data);
                    if (response.data.isLiked) {
                        toggleLikes(true);
                    }
                }
        }

        toggleLikes(false);
        setPostData(undefined);
        postFetcher();
    }, [postId])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // To prevent screen jumping when data loaded
    if(!postData) {
        return <div className="h-screen" />;
    }
    
    return (
        <div>
            { showDeletePostConfirmModal ? <ConfirmModal
                confirmMessage="Are you sure you want to delete the post?"
                setShowConfirmModal={setShowDeletePostConfirmModal}
                callbackAfterConfirm={handleDeletePost}
            /> : null}
            { activePostPictureURL && <ActivePicture closeModal={closeActiveImage} imageURL={activePostPictureURL} /> }
            <div key={location.pathname + location.search}>
                { postData.parentPost ?
                <Link to={specificPostURI(postData.parentPost.postId)}>
                    <div className="w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
                        <p className="text-white"><span className="font-bold">Reply to:</span> {postData.parentPost?.title}</p>
                    </div>
                </Link> : null }
                <div className="w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <PostOwnerComponent ownerData={postData.owner} postPublished={postData.published} avatarHeight={10} />
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={toggleMenu}
                                className="p-2 rounded-full text-white transition-all"
                                title="Options"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="24" height="24" viewBox="0 0 24 24" 
                                    fill="none" stroke="currentColor" strokeWidth="2" 
                                    strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 text-white bg-white/20 border hover:bg-white/30 border-white/40 rounded-md shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <button
                                        onClick={() => { setShowDeletePostConfirmModal(true); setMenuOpen(false) }}
                                        className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="16" height="16" viewBox="0 0 24 24" 
                                            fill="none" stroke="currentColor" strokeWidth="2" 
                                            strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Delete post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-white leading-relaxed mb-4 font-bold">{postData.title}</div>

                    <div className="text-white leading-relaxed mb-4">{postData.text}</div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        { postData.picturesURLs.map((url: string, index: number) => {
                            return (
                                <div className="relative block aspect-square cursor-pointer" key={index}>
                                    <img onClick={() => setActivePostPictureURL(url)} className="w-full h-full object-cover rounded-lg" src={url} alt="Post image"/>
                                </div>
                            )
                            })
                        }
                    </div>
                    <div className="flex justify-start items-center gap-3">
                        <button onClick={()=> { if(!likeTimeout) { likeAction() } }}>
                            <img src={liked ? "/thumbs-up-filled.png" : "/thumbs-up.png"} alt="like-icon" className="h-8 mt-4 hover:scale-110 transition-all" />
                        </button>
                        <div className="mt-4 text-white flex gap-3">
                            <span>Likes: {postData.likes}</span> <span>Views: {postData.views}</span>
                        </div>
                    </div>
                </div>

                <MakePost postType={"reply"} parentPostId={postData.postId} />

                <div className="w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
                    <div className="font-bold text-xl text-white">Comments {postData.replies}:</div>
                    <PostComments originalPostId={postData.postId} />
                </div>
            </div>            
        </div>
    );
}

export default PostPage;