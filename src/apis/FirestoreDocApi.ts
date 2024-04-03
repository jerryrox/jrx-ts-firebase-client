import { DocumentReference, DocumentSnapshot, getDoc, onSnapshot } from "firebase/firestore";
import { AsyncResponse, BaseApi, Bindable } from "jrx-ts";

/**
 * Variant of BaseApi that supports Firestore document streaming.
 */
export default abstract class FirestoreDocApi<T = any> extends BaseApi<T> {

    /**
     * The latest observed data via stream.
     */
    readonly curData = new Bindable<T | undefined>(undefined);

    private streamCanceller: (() => void) | undefined = undefined;


    startStream(onData?: (data: T | undefined) => any) {
        this.stopStream();

        this.streamCanceller = onSnapshot(this.getReference(), (snapshot) => {
            this.onSnapshot(snapshot);
            if (onData !== undefined) {
                onData(this.parseSnapshot(snapshot));
            }
        });
    }

    stopStream() {
        if (this.streamCanceller !== undefined) {
            this.streamCanceller();
            this.streamCanceller = undefined;
        }
    }

    protected async requestInternal(): Promise<AsyncResponse<T>> {
        const ref = this.getReference();
        const response = await getDoc(ref);
        return AsyncResponse.success(this.parseData(response));
    }

    /**
     * Returns the query used for streaming.
     */
    protected abstract getReference(): DocumentReference;

    /**
     * Parses the specified document snapshot into model T.
     */
    protected abstract parseData(snapshot: DocumentSnapshot): T;

    private parseSnapshot(snapshot: DocumentSnapshot): T | undefined {
        return snapshot.exists() ? this.parseData(snapshot) : undefined;
    }

    private onSnapshot(snapshot: DocumentSnapshot) {
        this.curData.value = this.parseSnapshot(snapshot);
    }
}