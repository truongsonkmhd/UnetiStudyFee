import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8097/ws-submission";

class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();

    connect() {
        if (this.client && this.client.active) return;

        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL) as any,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ WebSocket connected");
            },
            onStompError: (frame) => {
                console.error("❌ STOMP error", frame);
            },
        });

        this.client.activate();
    }

    subscribe(destination: string, callback: (data: any) => void) {
        if (!this.client) {
            this.connect();
        }

        const isConnected = this.client && this.client.connected;

        if (isConnected) {
            const subscription = this.client!.subscribe(destination, (message: IMessage) => {
                try {
                    callback(JSON.parse(message.body));
                } catch (e) {
                    console.error("❌ Failed to parse WS message body", e);
                }
            });
            this.subscriptions.set(destination, subscription);
        } else {
            console.log(`⏳ Connection not ready, queuing subscription for ${destination}`);
            const oldOnConnect = this.client!.onConnect;
            this.client!.onConnect = (frame) => {
                if (oldOnConnect) oldOnConnect(frame);
                this.subscribe(destination, callback);
            };
        }
    }

    unsubscribe(destination: string) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.subscriptions.clear();
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
