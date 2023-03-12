from web3 import Web3
import json

# Connect to a local Ethereum node
w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))
# Load the compiled contract ABI
with open('contract_abi.json', 'r') as abi_definition:
    abi = json.load(abi_definition)

# Load the compiled contract bytecode
with open('contract_bytecode.txt', 'r') as bytecode_file:
    bytecode = bytecode_file.read().replace('\n', '')

# Instantiate the contract object
contract = w3.eth.contract(abi=abi, bytecode=bytecode)
# Get the transaction hash
tx_hash = contract.deploy(transaction={'from': w3.eth.accounts[0]})

# Wait for the transaction to be mined
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)

# Get the contract address
contract_address = tx_receipt.contractAddress
# Get the contract instance
my_contract = w3.eth.contract(address=contract_address, abi=abi)

# Call a function on the contract
result = my_contract.functions.my_function().call()

# Send a transaction to the contract
tx_hash = my_contract.functions.my_function().transact({'from': w3.eth.accounts[0]})
