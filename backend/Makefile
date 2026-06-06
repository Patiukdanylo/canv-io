.PHONY: up down build logs migrate revision seed psql shell

up:        ## build + start the whole stack (api, db, adminer)
	docker compose up --build

down:      ## stop the stack
	docker compose down

logs:      ## tail the api logs
	docker compose logs -f api

migrate:   ## apply migrations inside the api container
	docker compose exec api alembic upgrade head

revision:  ## autogenerate a migration: make revision m="add x"
	docker compose exec api alembic revision --autogenerate -m "$(m)"

seed:      ## (re)run the seeder
	docker compose exec api python -m app.seed

psql:      ## open a psql shell on the db
	docker compose exec db psql -U $${POSTGRES_USER:-canvio} -d $${POSTGRES_DB:-canvio}

shell:     ## a shell in the api container
	docker compose exec api bash
