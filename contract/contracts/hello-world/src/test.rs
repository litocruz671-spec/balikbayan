#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env,
};

fn setup() -> (Env, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let ofw = Address::generate(&env);
    let family = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(admin.clone());
    let token_address = token_id.address();
    let token_admin = token::StellarAssetClient::new(&env, &token_address);
    token_admin.mint(&ofw, &10_000_0000000);
    (env, ofw, family, admin, token_address)
}

#[test]
fn test_create_escrow() {
    let (env, ofw, family, _, token) = setup();
    let contract_id = env.register(BalikBayanContract, ());
    let client = BalikBayanContractClient::new(&env, &contract_id);
    let escrow_id = client.create_escrow(
        &ofw,
        &family,
        &token,
        &1_000_0000000,
        &BillType::Tuition,
        &(env.ledger().timestamp() + 604800),
    );
    assert_eq!(escrow_id, 1);
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Active);
    assert_eq!(escrow.amount, 1_000_0000000);
}

#[test]
fn test_confirm_payment_mints_box() {
    let (env, ofw, family, _, token) = setup();
    let contract_id = env.register(BalikBayanContract, ());
    let client = BalikBayanContractClient::new(&env, &contract_id);
    let escrow_id = client.create_escrow(
        &ofw,
        &family,
        &token,
        &1_000_0000000,
        &BillType::Electricity,
        &(env.ledger().timestamp() + 604800),
    );
    client.confirm_payment(&escrow_id);
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Fulfilled);
    assert_eq!(escrow.box_minted, true);
    let box_count = client.get_box_count(&ofw);
    assert_eq!(box_count, 1);
}

#[test]
fn test_tier_progression() {
    let (env, ofw, family, _, token) = setup();
    let contract_id = env.register(BalikBayanContract, ());
    let client = BalikBayanContractClient::new(&env, &contract_id);
    for _ in 0..5 {
        let escrow_id = client.create_escrow(
            &ofw,
            &family,
            &token,
            &500_0000000,
            &BillType::Water,
            &(env.ledger().timestamp() + 604800),
        );
        client.confirm_payment(&escrow_id);
    }
    let tier = client.get_tier(&ofw);
    assert_eq!(tier, soroban_sdk::String::from_str(&env, "Silver"));
}

#[test]
fn test_refund_after_deadline() {
    let (env, ofw, family, _, token) = setup();
    let contract_id = env.register(BalikBayanContract, ());
    let client = BalikBayanContractClient::new(&env, &contract_id);
    let deadline = env.ledger().timestamp() + 100;
    let escrow_id = client.create_escrow(
        &ofw,
        &family,
        &token,
        &1_000_0000000,
        &BillType::Medical,
        &deadline,
    );
    env.ledger().with_mut(|l| l.timestamp = deadline + 1);
    let result = client.claim_refund(&escrow_id);
    assert_eq!(result, true);
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Expired);
}

#[test]
fn test_raise_dispute() {
    let (env, ofw, family, _, token) = setup();
    let contract_id = env.register(BalikBayanContract, ());
    let client = BalikBayanContractClient::new(&env, &contract_id);
    let escrow_id = client.create_escrow(
        &ofw,
        &family,
        &token,
        &1_000_0000000,
        &BillType::Rent,
        &(env.ledger().timestamp() + 604800),
    );
    let result = client.raise_dispute(&escrow_id, &ofw);
    assert_eq!(result, true);
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Disputed);
}