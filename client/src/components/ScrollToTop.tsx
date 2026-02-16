import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop component
 * Automatically scrolls to the top of the page when the route changes
 */
export function ScrollToTop() {
    const [location] = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return null;
}
