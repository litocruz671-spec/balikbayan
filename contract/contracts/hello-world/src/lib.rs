#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String,
};
#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum BillType {
    Tuition,
    Electricity,
    Water,
    Internet,
    Medical,
    Rent,
    Grocery,
    Medicine,
    Savings,
    Custom,
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum EscrowStatus {
    Active,
    Fulfilled,
    Expired,
    Disputed,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Escrow {
    pub ofw:        Address,
    pub family:     Address,
    pub token:      Address,
    pub amount:     i128,
    pub bill_type:  BillType,
    pub deadline:   u64,
    pub status:     EscrowStatus,
    pub box_minted: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct BalikBayanBox {
    pub ofw:        Address,
    pub amount:     i128,
    pub timestamp:  u64,
    pub bill_type:  BillType,
    pub box_number: u32,
}

#[contracttype]
pub enum DataKey {
    Escrow(u32),
    EscrowCount,
    BoxCount(Address),
    Box(Address, u32),
}

#[contract]
pub struct BalikBayanContract;

#[contractimpl]
impl BalikBayanContract {

    pub fn create_escrow(
        env: Env,
        ofw: Address,
        family: Address,
        token: Address,
        amount: i128,
        bill_type: BillType,
        deadline: u64,
    ) -> u32 {
        ofw.require_auth();

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&ofw, &env.current_contract_address(), &amount);

        let escrow_id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::EscrowCount)
            .unwrap_or(0);

        let new_id = escrow_id + 1;

        let escrow = Escrow {
            ofw,
            family,
            token,
            amount,
            bill_type,
            deadline,
            status: EscrowStatus::Active,
            box_minted: false,
        };

        env.storage().instance().set(&DataKey::Escrow(new_id), &escrow);
        env.storage().instance().set(&DataKey::EscrowCount, &new_id);

        new_id
    }

    pub fn confirm_payment(env: Env, escrow_id: u32) -> bool {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        escrow.family.require_auth();

        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");
        assert!(
            env.ledger().timestamp() <= escrow.deadline,
            "Deadline passed"
        );

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.family,
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Fulfilled;
        escrow.box_minted = true;
        env.storage().instance().set(&DataKey::Escrow(escrow_id), &escrow);

        Self::mint_box(&env, &escrow.ofw, escrow.amount, escrow.bill_type.clone());

        true
    }

    pub fn claim_refund(env: Env, escrow_id: u32) -> bool {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        escrow.ofw.require_auth();

        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");
        assert!(
            env.ledger().timestamp() > escrow.deadline,
            "Deadline not yet passed"
        );

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.ofw,
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Expired;
        env.storage().instance().set(&DataKey::Escrow(escrow_id), &escrow);

        true
    }

    pub fn raise_dispute(env: Env, escrow_id: u32, caller: Address) -> bool {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        caller.require_auth();

        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");
        assert!(
            caller == escrow.ofw || caller == escrow.family,
            "Not authorized"
        );

        escrow.status = EscrowStatus::Disputed;
        env.storage().instance().set(&DataKey::Escrow(escrow_id), &escrow);

        true
    }

    pub fn get_escrow(env: Env, escrow_id: u32) -> Escrow {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found")
    }

    pub fn get_box_count(env: Env, ofw: Address) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::BoxCount(ofw))
            .unwrap_or(0)
    }

    pub fn get_box(env: Env, ofw: Address, box_number: u32) -> BalikBayanBox {
        env.storage()
            .instance()
            .get(&DataKey::Box(ofw, box_number))
            .expect("Box not found")
    }

    pub fn get_tier(env: Env, ofw: Address) -> String {
        let count = Self::get_box_count(env.clone(), ofw);
        if count >= 60 {
            String::from_str(&env, "Legend")
        } else if count >= 24 {
            String::from_str(&env, "Diamond")
        } else if count >= 12 {
            String::from_str(&env, "Gold")
        } else if count >= 5 {
            String::from_str(&env, "Silver")
        } else {
            String::from_str(&env, "Common")
        }
    }

    fn mint_box(env: &Env, ofw: &Address, amount: i128, bill_type: BillType) {
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::BoxCount(ofw.clone()))
            .unwrap_or(0);

        let new_count = count + 1;

        let new_box = BalikBayanBox {
            ofw: ofw.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
            bill_type,
            box_number: new_count,
        };

        env.storage()
            .instance()
            .set(&DataKey::Box(ofw.clone(), new_count), &new_box);

        env.storage()
            .instance()
            .set(&DataKey::BoxCount(ofw.clone()), &new_count);
    }
}
mod test;