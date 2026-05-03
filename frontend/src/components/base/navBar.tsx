import React, { useEffect, useState, useRef, RefObject, useContext } from "react";
import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import  { AccessTokenCookieKey, homeURI, loginURI, myProfileURI, RefreshTokenCookieKey, registerURI } from "../../consts.ts";
import SearchBar from "./searchBar.tsx";
import { fetchLogout } from "../../fetching/fetchAuth";
import { safeAPICallNoToken } from "../../fetching/fetchUtils";
import { SuccessfulResponse } from "../../fetching/DTOs";
import { TokensContext } from "../../index.tsx";
import ConfirmModal from "./confirmModal.tsx";

const NavigationBar = (): ReactNode => {
    const navigate = useNavigate();
    const tokensContexted = useContext(TokensContext);
    const tokens = tokensContexted.tokens;
    const loggedIn = tokensContexted.booleanLoggedInIndicatorState;
    const [ showLogoutConfirmModal, setShowLogoutConfirmModal ] = useState(false);
        
    const handleLogout = () => {
        setShowLogoutConfirmModal(false);
        tokensContexted.removeTokens();
        navigate(loginURI);
        safeAPICallNoToken<SuccessfulResponse>(fetchLogout, navigate, undefined, tokens.access, tokens.refresh);
    };

    return (
        <div>
            { showLogoutConfirmModal ? <ConfirmModal
                confirmMessage="Are you sure you want to logout?"
                setShowConfirmModal={setShowLogoutConfirmModal}
                callbackAfterConfirm={handleLogout}
            /> : null}
            <nav className="w-full">
                <div className="flex items-center justify-between w-full p-4">
                    <div className="flex items-center w-1/3">
                        <Link to={homeURI} className="flex items-center">
                            <img
                                src="/connect-logo-full.png"
                                className="h-15 w-auto hover:scale-110 transition-all"
                                alt="Connect Logo"
                            />
                        </Link>
                    </div>
                
                    <div className="flex justify-center w-1/3">
                        <div className="w-full max-w-md">
                            <SearchBar />
                        </div>
                    </div>

                    <ul className="flex items-center justify-end w-1/3 space-x-4">
                        <li>
                            <Link to="/" className="py-2 px-3" aria-current="page">
                                <img src="/feed-title.png" alt="Feed" className="h-10 w-auto hover:scale-110 transition-all" />
                            </Link>
                        </li>
                        <li>
                            <Link to="/chats" className="py-2 px-3">
                                <img src="/chat-title.png" alt="Chat" className="h-10 w-auto hover:scale-110 transition-all" />
                            </Link>
                        </li>
                        <li>
                            <Link to={myProfileURI} className="py-2 px-3">
                                <img src="/me-title.png" alt="Me" className="h-10 w-auto hover:scale-110 transition-all" />
                            </Link>
                        </li>
                        <li>
                            {loggedIn ?
                                <button onClick={() => setShowLogoutConfirmModal(true)} className="py-2 px-3">
                                    <img src="/logout-title.png" alt="Me" className="h-10 w-auto hover:scale-110 transition-all" />
                                </button>
                                :
                                <Link to={registerURI}>
                                    <img src="/sign-in-title.png" alt="Sign in" className="h-10 w-auto hover:scale-110 transition-all" />
                                </Link>
                            }
                        </li>
                    </ul>

                </div>
            </nav>
        </div>
    );
}

export default NavigationBar;