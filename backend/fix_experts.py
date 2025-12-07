from app.db.database import SessionLocal
from app.models.models import User, Expert, UserRole

def fix_experts():
    db = SessionLocal()
    try:
        # Find users with role 'expert' who don't have an expert_profile
        experts_users = db.query(User).filter(User.role == UserRole.EXPERT).all()
        
        count = 0
        for user in experts_users:
            # Check if expert record exists
            existing_expert = db.query(Expert).filter(Expert.id == user.id).first()
            
            if not existing_expert:
                print(f"Creating expert profile for user: {user.email} ({user.id})")
                expert = Expert(
                    id=user.id,
                    domain="General",
                    is_available=True,
                    verified=False
                )
                db.add(expert)
                count += 1
        
        if count > 0:
            db.commit()
            print(f"Successfully created {count} expert profiles.")
        else:
            print("No missing expert profiles found.")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_experts()
