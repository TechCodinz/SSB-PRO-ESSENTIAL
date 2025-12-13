"""
Wallet Key Encryption Utility for SSB PRO
Encrypts private keys so they can be safely used by the trading engine.
"""
import hashlib
import base64
import os
from cryptography.fernet import Fernet

# Get SECRET_KEY from environment or use default
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_SUPER_SECRET_KEY_2025")

def encrypt_key(private_key: str) -> str:
    """Encrypt a private key for safe storage"""
    key = hashlib.sha256(SECRET_KEY.encode()).digest()
    cipher = Fernet(base64.urlsafe_b64encode(key))
    return cipher.encrypt(private_key.encode()).decode()

def decrypt_key(encrypted_key: str) -> str:
    """Decrypt a private key"""
    key = hashlib.sha256(SECRET_KEY.encode()).digest()
    cipher = Fernet(base64.urlsafe_b64encode(key))
    return cipher.decrypt(encrypted_key.encode()).decode()

if __name__ == "__main__":
    print("=" * 60)
    print("  SSB PRO - Wallet Key Encryption Utility")
    print("=" * 60)
    
    # The private key to encrypt
    private_key = "2fR4q7GNDDYXuBoCr8UteWDKVM3TXiir7Rm4UFjvfz6TVkfAJtgRxNWwyNVMq5fef69ppoQrHb5pHVbgebtiHZ45"
    
    print(f"\nOriginal Key: {private_key[:20]}...{private_key[-10:]}")
    
    encrypted = encrypt_key(private_key)
    print(f"\nEncrypted Key:\n{encrypted}")
    
    # Verify decryption works
    decrypted = decrypt_key(encrypted)
    print(f"\nDecryption Verified: {decrypted == private_key}")
    
    print("\n" + "=" * 60)
    print("  Copy the encrypted key above to use in the engine config")
    print("=" * 60)
