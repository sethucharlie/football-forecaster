import psycopg2

try:
    conn = psycopg2.connect(
        host="aws-1-eu-west-1.pooler.supabase.com",
        port=6543,
        user="postgres.ijbvmkhudvfkkuxzghnh",
        password="goalpredictor2026",
        dbname="postgres",
        sslmode="require"
    )
    print("Connected OK")
except Exception as e:
    print("ERROR:", e)