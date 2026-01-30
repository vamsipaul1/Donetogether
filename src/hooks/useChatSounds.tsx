import { useEffect, useRef } from 'react';

// Sound effect hooks for chat
export const useChatSounds = () => {
    const sendSound = useRef<HTMLAudioElement | null>(null);
    const receiveSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio elements for send/receive sounds
        sendSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYGGGi58OScTgwNUKrj77RnHAU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGg==');
        receiveSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYGGGi58OScTgwNUKrj77RnHAU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGgU7k9n0yHgrBSl+zPLaizsIHGS37+mjUBELTqXh8bJpGg==');

        // Set volume to be subtle
        if (sendSound.current) sendSound.current.volume = 0.3;
        if (receiveSound.current) receiveSound.current.volume = 0.2;
    }, []);

    const playSendSound = () => {
        sendSound.current?.play().catch(() => {/* ignore */ });
    };

    const playReceiveSound = () => {
        receiveSound.current?.play().catch(() => {/* ignore */ });
    };

    return { playSendSound, playReceiveSound };
};
