package de.tum.in.www1.artemis.config.localvcci.ssh;

import java.security.PublicKey;

import org.apache.sshd.common.config.keys.KeyUtils;
import org.apache.sshd.common.digest.BuiltinDigests;

public class HashUtils {

    public static String getSha512Fingerprint(PublicKey key) {
        return KeyUtils.getFingerPrint(BuiltinDigests.sha512.create(), key);
    }
}
