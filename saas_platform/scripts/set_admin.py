"""
Set ADMIN Plan for peterprince009@gmail.com

Run this on the VPS: python scripts/set_admin.py
"""
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import SessionLocal
from api.models.user import User

def set_admin_plan():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "peterprince009@gmail.com").first()
        
        if not user:
            print("❌ User peterprince009@gmail.com not found!")
            return False
        
        old_plan = user.plan
        user.plan = "admin"
        db.commit()
        
        print("=" * 60)
        print("  ✅ ADMIN PLAN ACTIVATED")
        print("=" * 60)
        print(f"  Email: {user.email}")
        print(f"  User ID: {user.id}")
        print(f"  Old Plan: {old_plan}")
        print(f"  New Plan: {user.plan} 👑")
        print("=" * 60)
        print()
        print("  ADMIN GOD MODE Features:")
        print("  • 20% min confidence (catch everything)")
        print("  • 9999 max positions (truly unlimited)")
        print("  • 200% take profit (moon shots)")
        print("  • Turbo mode (1.5x position sizing)")
        print("  • Win streak momentum (up to +25%)")
        print("  • Balance-aware compounding")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    set_admin_plan()
