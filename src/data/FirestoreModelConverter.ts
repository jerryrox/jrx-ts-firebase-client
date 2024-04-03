import { DocumentSnapshot, Timestamp } from "firebase/firestore";
import { ModelConverter } from "jrx-ts";

export default abstract class FirestoreModelConverter<T extends Object> extends ModelConverter<T> {
    private isFunctionCompatible: boolean = false;

    /**
     * Converts the specified document snapshot into model T.
     * Returns undefined if the snapshot does not exist.
     */
    fromSnapshot(snapshot: DocumentSnapshot): T | undefined {
        if (!snapshot.exists) {
            return undefined;
        }
        return this.toModel(snapshot.id, snapshot.data());
    }

    /**
     * Converts the specified document snapshot into model T.
     * Returns null if the conversion fails.
     * Returns undefined if the snapshot does not exist.
     */
    fromSnapshotSafe(snapshot: DocumentSnapshot): T | null | undefined {
        if (!snapshot.exists) {
            return undefined;
        }
        return this.toModelSafe(snapshot.id, snapshot.data()) ?? null;
    }

    /**
     * Converts the specified model into plain object compatible with Function response.
     */
    toPlainForFunction(model: T): any {
        const wasCompatible = this.isFunctionCompatible;
        this.setFunctionCompatible(true);
        const plain = this.toPlain(model);
        this.setFunctionCompatible(wasCompatible);
        return plain;
    }

    /**
     * When sending the client response via Firebase Functions, certain values must be of supported types or it'll throw an error.
     * For example, Sending Timestamp via Function response will throw an error.
     * Setting this to true will encode the values to Function compatible types.
     */
    setFunctionCompatible(value: boolean) {
        this.isFunctionCompatible = value;
        for(const subconverter of this.subconverters) {
            if (subconverter instanceof FirestoreModelConverter) {
                subconverter.setFunctionCompatible(value);
            }
        }
    }

    encodeDate(value: Date) {
        if (this.isFunctionCompatible) {
            return super.encodeDate(value);
        }
        return this.encodeDateFirestore(value);
    }

    decodeDate(value: any, defaultValue?: Date | undefined): Date {
        if (value instanceof Timestamp) {
            return value.toDate();
        }
        return super.decodeDate(value, defaultValue);
    }

    private encodeDateFirestore(value: Date) {
        return Timestamp.fromDate(value);
    }
}