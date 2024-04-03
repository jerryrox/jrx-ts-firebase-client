import { DocumentSnapshot, Query, QuerySnapshot, getDocs, onSnapshot } from "firebase/firestore";
import { AsyncResponse, BaseApi, Bindable } from "jrx-ts";

/**
 * Variant of BaseApi that supports Firestore query streaming.
 */
export default abstract class FirestoreQueryApi<T = any> extends BaseApi<T[]> {

    readonly curData = new Bindable<T[]>([]);

    private streamCanceller: (() => void) | null = null;


    startStream(onData?: (data: T[]) => any) {
        this.stopStream();

        this.streamCanceller = onSnapshot(this.getQuery(), (snapshot) => {
            this.onSnapshot(snapshot);
            if (onData !== undefined) {
                onData(this.parseSnapshot(snapshot));
            }
        });
    }

    stopStream() {
        if (this.streamCanceller !== null) {
            this.streamCanceller();
            this.streamCanceller = null;
        }
    }

    protected async requestInternal(): Promise<AsyncResponse<T[]>> {
        const query = this.getQuery();
        const response = await getDocs(query);
        return AsyncResponse.success(this.parseSnapshot(response));
    }

    /**
     * Returns the query used for streaming.
     */
    protected abstract getQuery(): Query;

    /**
     * Parses the specified document snapshot into model T.
     */
    protected abstract parseData(snapshot: DocumentSnapshot): T;

    private parseSnapshot(snapshot: QuerySnapshot): T[] {
        return snapshot.docs.map(doc => this.parseData(doc));
    }

    private onSnapshot(snapshot: QuerySnapshot) {
        this.curData.value = this.parseSnapshot(snapshot);
    }
}