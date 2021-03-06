TRUNCATE txins CASCADE;
TRUNCATE txouts CASCADE;
TRUNCATE transactions CASCADE;
TRUNCATE blocks CASCADE;
TRUNCATE addresses CASCADE;

ALTER SEQUENCE addresses_id_seq RESTART;
ALTER SEQUENCE currencies_id_seq RESTART;
ALTER SEQUENCE last_blocks_currency_seq RESTART;
ALTER SEQUENCE transactions_id_seq RESTART;
ALTER SEQUENCE txins_index_seq RESTART;

UPDATE last_blocks SET "blockIndex" = NULL;